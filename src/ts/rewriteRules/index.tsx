import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "../store";
import { actions as actionCreators } from "./slice";
import { Button, Input, Switch, Tooltip } from "antd";
import {
	CheckOutlined,
	CloseOutlined,
	DeleteOutlined,
	PlusOutlined
} from "@ant-design/icons";
import "./rewriteRule.scss";

function useActions<
	T extends {
		[action: string]: <K>(payload: K) => void;
	}
>(actionContainer: T): T {
	const dispatch = useDispatch();

	const wrapped = { ...actionContainer };
	Object.keys(wrapped).forEach((key: keyof T) => {
		const actionCreateor = wrapped[key];
		(wrapped[key] as any) = function(parameter: any) {
			dispatch(actionCreateor(parameter));
		};
	});

	return wrapped;
}

export const RewriteRules: React.FC = () => {
	const rules = useSelector((state: AppState) => state.rewriteRules);
	const actions = useActions(actionCreators);
	const handleAdd = useCallback(() => {
		actions.add({
			active: true,
			from: "",
			to: "",
			regex: false
		});
	}, [actions]);

	if (rules.length === 0) {
		return <FullScreenAddButton onClick={handleAdd} />;
	}

	return (
		<div>
			<div className="rewrite-rules-list">
				{rules.map(rule => (
					<RewriteRule key={rule.id} id={rule.id} />
				))}
			</div>
			<Button
				className="add-rule-button"
				icon={<PlusOutlined />}
				onClick={handleAdd}
				type="primary"
			>
				Add rule
			</Button>
		</div>
	);
};

const FullScreenAddButton: React.FC<{
	onClick: () => void;
}> = ({ onClick }) => {
	return (
		<div className="fullscreen-add-wrapper">
			<Button
				type="primary"
				size="large"
				icon={<PlusOutlined />}
				onClick={onClick}
			>
				New rule
			</Button>
		</div>
	);
};

const RewriteRule: React.FC<{
	id: number;
}> = ({ id }) => {
	const rule = useSelector((state: AppState) =>
		state.rewriteRules.find(rule => rule.id === id)
	);
	const actions = useActions(actionCreators);
	const [state, setState] = useState(
		rule
			? {
					from: rule.from,
					to: rule.to
			  }
			: {
					from: "",
					to: ""
			  }
	);
	const handleBlur = () => {
		actions.update({
			id,
			...state
		});
	};

	if (!rule) {
		return null;
	}
	const { active } = rule;

	return (
		<div className={active ? "rewrite-rule" : "rewrite-rule disabled"}>
			<Switch
				checked={active}
				onChange={() => actions.toggleActive(id)}
				checkedChildren={<CheckOutlined />}
				unCheckedChildren={<CloseOutlined />}
			></Switch>
			<table>
				<tbody>
					<tr>
						<td>From</td>
						<td>
							<Input
								value={state.from}
								onChange={({ target: { value } }) => {
									setState(prev => ({
										...prev,
										from: value
									}));
								}}
								onBlur={handleBlur}
							/>
						</td>
					</tr>
					<tr>
						<td>To</td>
						<td>
							<Input
								value={state.to}
								onChange={({ target: { value } }) => {
									setState(prev => ({
										...prev,
										to: value
									}));
								}}
								onBlur={handleBlur}
							/>
						</td>
					</tr>
				</tbody>
			</table>
			<Tooltip title="Delete">
				<Button
					type="ghost"
					style={{
						border: 0
					}}
					onClick={() => actions.delete(id)}
				>
					<DeleteOutlined className="delete-rule" aria-role="button" />
				</Button>
			</Tooltip>
		</div>
	);
};
